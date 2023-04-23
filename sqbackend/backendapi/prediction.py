import numpy as np
from transformers import TFGPT2LMHeadModel, GPT2Tokenizer
from allennlp.predictors.predictor import Predictor
from flashtext import KeywordProcessor
import traceback
from nltk.tree import Tree
from nltk.corpus import stopwords
import pke
import random
import itertools
import re
import string
import requests
import json
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import nltk
from nltk.corpus import wordnet as wn
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('punkt')
nltk.download('stopwords')
#import tensorflow as tf

class Predictor:
    model_dir = "./backendapi/DLModels/checkpoint-2200"
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
    constituency_predictor = Predictor.from_path(
        "https://storage.googleapis.com/allennlp-public-models/elmo-constituency-parser-2020.02.10.tar.gz")
    GPT2Tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    GPT2Model = TFGPT2LMHeadModel.from_pretrained(
        "gpt2", pad_token_id=GPT2Tokenizer.eos_token_id)

    def predict_sa(self, sentence):
        inputs = ["summarize: " + sentence]
        inputs = self.tokenizer(inputs, max_length=512,
                                truncation=True, return_tensors="pt")
        output = self.model.generate(**inputs, num_beams=15, temperature=0.5,
                                     num_return_sequences=1, early_stopping=True, min_length=10, max_length=64)
        decoded_output = self.tokenizer.batch_decode(
            output, skip_special_tokens=True)[0]
        prediction = nltk.sent_tokenize(decoded_output.strip())[0]
        question_answer = prediction.split('?')

        # If not exactly one question mark discard question, something is malformed
        if len(question_answer) == 2:
            return {'type': 'SA', 'question': question_answer[0] + '?', 'answer': question_answer[1]}
        else:
            return None

    def predict_mcq(self, question, answer):
        synsets = wn.synsets(answer, 'n')
        if not synsets:
            return None
        synset = synsets[0]

        distractors = []
        word = answer.lower()
        orig_word = word
        if len(word.split()) > 0:
            word = word.replace(" ", "_")
        hypernym = synset.hypernyms()
        if len(hypernym) == 0:
            return None
        for item in hypernym[0].hyponyms():
            name = item.lemmas()[0].name()
            if name == orig_word:
                continue
            name = name.replace("_", " ")
            name = " ".join(w.capitalize() for w in name.split())
            if name is not None and name not in distractors:
                distractors.append(name)

        if len(distractors) < 3:
            return None

        mcq_answers = [answer]
        random.shuffle(distractors)
        for word in distractors[:3]:
            mcq_answers.append(word)
        random.shuffle(mcq_answers)

        # Convert to string for DB
        final_answer = ''
        for option in mcq_answers:
            final_answer += option.capitalize() + '|'
        # Add on real answer at end
        final_answer += answer.capitalize()

        return {'type': 'MCQ', 'question': question, 'answer': final_answer}

    def get_fill_in_the_blanks(self, sentence_mapping):
        processed = []
        questions = []
        for key in sentence_mapping:
            if len(sentence_mapping[key]) > 0:
                sent = sentence_mapping[key][0]
                # Compile a regular expression pattern into a regular expression object, which can be used for matching
                insensitive_sent = re.compile(re.escape(key), re.IGNORECASE)
                no_of_replacements = len(re.findall(
                    re.escape(key), sent, re.IGNORECASE))
                line = insensitive_sent.sub(' _________ ', sent)
                if (sentence_mapping[key][0] not in processed) and no_of_replacements < 2:
                    processed.append(sentence_mapping[key][0])
                    questions.append(
                        {'type': 'FIB', 'question': 'Fill in the blank in the following: ' + line, 'answer': key})
        return questions

    def get_sentences_for_keyword(self, keywords, sentences):
        keyword_processor = KeywordProcessor()
        keyword_sentences = {}
        for word in keywords:
            keyword_sentences[word] = []
            keyword_processor.add_keyword(word)
        for sentence in sentences:
            keywords_found = keyword_processor.extract_keywords(sentence)
            for key in keywords_found:
                keyword_sentences[key].append(sentence)

        for key in keyword_sentences.keys():
            values = keyword_sentences[key]
            values = sorted(values, key=len, reverse=True)
            keyword_sentences[key] = values
        return keyword_sentences

    def get_noun_adj_verb(self, text):
        out = []

        try:
            extractor = pke.unsupervised.MultipartiteRank()
            extractor.load_document(input=text, language='en')
            pos = {'VERB', 'ADJ', 'NOUN'}
            stoplist = list(string.punctuation)
            stoplist += ['-lrb-', '-rrb-', '-lcb-', '-rcb-', '-lsb-', '-rsb-']
            stoplist += stopwords.words('english')
            extractor.candidate_selection(pos=pos)
            extractor.candidate_weighting(alpha=1.1,
                                          threshold=0.75,
                                          method='average')
            keyphrases = extractor.get_n_best(n=30)

            for val in keyphrases:
                out.append(val[0])
        except:
            out = []
            traceback.print_exc()

        return out

    def get_flattened(self, t):
        sent_str_final = None
        if t is not None:
            sent_str = [" ".join(x.leaves()) for x in list(t)]
            sent_str_final = [" ".join(sent_str)]
            sent_str_final = sent_str_final[0]
        return sent_str_final

    def get_right_most_VP_or_NP(self, parse_tree, last_NP=None, last_VP=None):
        if len(parse_tree.leaves()) == 1:
            return last_NP, last_VP
        try:
            last_subtree = parse_tree[-1]
        except IndexError:
            return None
        if last_subtree.label() == "NP":
            last_NP = last_subtree
        elif last_subtree.label() == "VP":
            last_VP = last_subtree

        return self.get_right_most_VP_or_NP(last_subtree, last_NP, last_VP)

    def get_termination_portion(self, main_string, sub_string):
        combined_sub_string = sub_string.replace(" ", "")
        main_string_list = main_string.split()
        last_index = len(main_string_list)
        for i in range(last_index):
            check_string_list = main_string_list[i:]
            check_string = "".join(check_string_list)
            check_string = check_string.replace(" ", "")
            if check_string == combined_sub_string:
                return " ".join(main_string_list[:i])

        return None

    def predict_fib(self, text):
        noun_verbs_adj = self.get_noun_adj_verb(text)
        sentences = nltk.sent_tokenize(text)
        keyword_sentence_mapping_noun_verbs_adj = self.get_sentences_for_keyword(
            noun_verbs_adj, sentences)
        return self.get_fill_in_the_blanks(keyword_sentence_mapping_noun_verbs_adj)

    def predict_tf(self, sentence):
        try:
            true_false = ["True", "False"]
            true_or_false = random.choice(true_false)
            if true_or_false == "True":
                return {'type': 'TF', 'question': 'True or False? ' + sentence, 'answer': 'True'}

            sentence = sentence.rstrip('?:!.,;')
            output = self.constituency_predictor.predict(sentence=sentence)
            tree_string = output["trees"]
            tree = Tree.fromstring(tree_string)
   
            last_nounphrase, last_verbphrase = self.get_right_most_VP_or_NP(tree)
            if not last_nounphrase or not last_verbphrase:
                return None
            last_nounphrase_flattened = self.get_flattened(last_nounphrase)
            last_verbphrase_flattened = self.get_flattened(last_verbphrase)
            longest_phrase_to_use = max(
                last_nounphrase_flattened, last_verbphrase_flattened, key=len)
            longest_phrase_to_use = re.sub(r"-LRB- ", "(", longest_phrase_to_use)
            longest_phrase_to_use = re.sub(r" -RRB-", ")", longest_phrase_to_use)
            split_sentence = self.get_termination_portion(
                sentence, longest_phrase_to_use)
            if not split_sentence:
                return None
        except Exception:
            return None

        #print(split_sentence)

        input_ids = self.GPT2Tokenizer.encode(
            split_sentence, return_tensors='tf')
        maximum_length = len(split_sentence.split())+40

        sample_outputs = self.GPT2Model.generate(
            input_ids,
            do_sample=True,
            max_length=maximum_length,
            top_p=0.80,  # 0.85
            top_k=30,  # 30
            repetition_penalty=10.0,
            num_return_sequences=1
        )

        generated_sentences = []
        for _, sample_output in enumerate(sample_outputs):
            decoded_sentence = self.GPT2Tokenizer.decode(
                sample_output, skip_special_tokens=True)
            final_sentence = nltk.sent_tokenize(decoded_sentence)[0]
            generated_sentences.append(final_sentence)

        false_sentence = random.choice(generated_sentences)
        return {'type': 'TF', 'question': 'True or False? ' + false_sentence, 'answer': 'False'}

    def predict(self, text):
        predicted_questions = []

        # FIB questions
        fib_questions = self.predict_fib(text)
        predicted_questions += fib_questions

        sentences = nltk.sent_tokenize(text)
        # SA, TF and MCQ questions
        for sent in sentences:
            predicted_question_tf = self.predict_tf(sent)
            if predicted_question_tf:
                predicted_questions.append(predicted_question_tf)

            predicted_question_sa = self.predict_sa(sent)
            if predicted_question_sa:
                if len(nltk.word_tokenize(predicted_question_sa['answer'])) == 1:
                    # If only one word in answer we can generate an MCQ
                    predicted_question_mcq = self.predict_mcq(
                        predicted_question_sa['question'], predicted_question_sa['answer'])
                    if predicted_question_mcq:
                        predicted_questions.append(predicted_question_mcq)
                else:
                    predicted_questions.append(predicted_question_sa)

        #print(predicted_questions)
        return predicted_questions

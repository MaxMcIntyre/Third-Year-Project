from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from transformers import GPT2Tokenizer, TFGPT2LMHeadModel
from allennlp.predictors.predictor import Predictor
from nltk.tree import Tree
from nltk.corpus import stopwords
import pke
import random
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
    T5Tokenizer = AutoTokenizer.from_pretrained(model_dir)
    T5Model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
    constituency_predictor = Predictor.from_path(
        "https://storage.googleapis.com/allennlp-public-models/elmo-constituency-parser-2020.02.10.tar.gz")
    GPT2Tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    GPT2Model = TFGPT2LMHeadModel.from_pretrained(
        "gpt2", pad_token_id=GPT2Tokenizer.eos_token_id)

    def predict_sa(self, sentence, num_return_sequences):
        predicted_questions = []

        inputs = ["summarize: " + sentence]
        inputs = self.T5Tokenizer(inputs, max_length=512,
                                  truncation=True, return_tensors="pt")
        outputs = self.T5Model.generate(**inputs, num_beams=15, temperature=0.8,
                                        num_return_sequences=num_return_sequences,
                                        early_stopping=True, min_length=10, max_length=64)
        for output in outputs:
            decoded_output = self.T5Tokenizer.decode(
                output, skip_special_tokens=True
            )
            predicted_question = nltk.sent_tokenize(decoded_output.strip())[0]
            question_answer = predicted_question.split('?')
            # If not exactly one question mark discard question, something is malformed
            if len(question_answer) == 2:
                predicted_questions.append(
                    {'type': 'SA', 'question': question_answer[0] + '?', 'answer': question_answer[1]})

        return predicted_questions

    def predict_mcq(self, question, answer):
        synsets = wn.synsets(answer, 'n')
        if not synsets:
            return None
        synset = synsets[0]
        hypernyms = synset.hypernyms()
        distractors = []

        for hypernym in hypernyms:
            hyponyms = hypernym.hyponyms()
            for hyponym in hyponyms:
                try:
                    distractor = hyponym.lemma_names()[0]
                except IndexError:
                    return None
                # Deal with multi-word distractors
                distractor = distractor.replace('_', ' ')

                # Avoid duplicate options
                if distractor != answer and distractor not in distractors:
                    distractors.append(distractor.title())

        # Always need at least 3 distractors
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

    def predict_fib(self, text):
        def get_keyphrases(text):
            try:
                stoplist = stopwords.words('english')
                text = ' '.join([word for word in text.split()
                                if word.lower() not in stoplist])

                extractor = pke.unsupervised.MultipartiteRank()
                extractor.load_document(input=text, language='en')
                extractor.candidate_selection()
                extractor.candidate_weighting()
                keyphrases = extractor.get_n_best(n=15)
                return keyphrases
            except Exception as e:
                print(e)
                return None

        def get_keyphrase_sentence_mapping(keyphrases, sentences):
            keyphrase_sentence_mapping = {}
            for item in keyphrases:
                # Each keyphrase is a tuple of (actual_keyphrase, weighting)
                keyphrase = item[0]
                keyphrase_sentence_mapping[keyphrase] = []
                for sentence in sentences:
                    if keyphrase in sentence:
                        keyphrase_sentence_mapping[keyphrase].append(sentence)

            return keyphrase_sentence_mapping

        keyphrases = get_keyphrases(text)
        if not keyphrases:
            return None
        sentences = nltk.sent_tokenize(text)
        keyphrase_sentence_mapping = get_keyphrase_sentence_mapping(
            keyphrases, sentences)
        output_questions = []

        for keyphrase in keyphrase_sentence_mapping.keys():
            for sentence in keyphrase_sentence_mapping[keyphrase]:
                if sentence.count(keyphrase) == 1:
                    sentence_with_blank = sentence.replace(keyphrase, '______')
                    output_questions.append(
                        {'type': 'FIB', 'question': 'Fill in the blank in the following: ' + sentence_with_blank, 'answer': keyphrase})

        return output_questions

    def predict_tf(self, sentence):
        def find_rightmost_vp_np(tree, rightmost_vp=None, rightmost_np=None):
            # Check whether node is a leaf
            if isinstance(tree, Tree):
                subtree = tree[-1]
                if isinstance(subtree, Tree):
                    if subtree.label() == 'NP':
                        rightmost_vp = subtree
                    elif subtree.label() == 'VP':
                        rightmost_np = subtree
                    return find_rightmost_vp_np(subtree, rightmost_vp, rightmost_np)
                else:
                    return rightmost_vp, rightmost_np
            else:
                return rightmost_vp, rightmost_np

        def get_cutoff_sentence(sentence, ending):
            sentence_split = sentence.split()
            ending_split = ending.split()
            try:
                cutoff_sentence_split = sentence_split[:len(
                    sentence_split)-len(ending_split)]
            except IndexError:
                return None
            return ' '.join(cutoff_sentence_split)

        try:
            true_false = ["True", "False"]
            true_or_false = random.choice(true_false)
            if true_or_false == "True":
                return {'type': 'TF', 'question': 'True or False? ' + sentence, 'answer': 'True'}

            # Strip trailing punctuation
            sentence = sentence.rstrip('?:!.,;')
            parse_tree = Tree.fromstring(
                self.constituency_predictor.predict(sentence=sentence)['trees'])

            rightmost_vp, rightmost_np = find_rightmost_vp_np(parse_tree)
            if not rightmost_vp and not rightmost_np:
                return None
            elif not rightmost_vp:
                sentence_ending = ' '.join(rightmost_np.leaves())
            elif not rightmost_np:
                sentence_ending = ' '.join(rightmost_vp.leaves())
            else:
                sentence_ending_vp = ' '.join(rightmost_vp.leaves())
                sentence_ending_np = ' '.join(rightmost_np.leaves())
                sentence_ending = max(sentence_ending_vp,
                                      sentence_ending_np, key=len)

            cutoff_sentence = get_cutoff_sentence(sentence, sentence_ending)
            if not cutoff_sentence:
                return None
        except:
            return None

        input_ids = self.GPT2Tokenizer.encode(
            cutoff_sentence, return_tensors='tf')

        outputs = self.GPT2Model.generate(
            input_ids,
            do_sample=True,
            max_length=100,
            no_repeat_ngram_size=2,
            repetition_penalty=10.0,
            temperature=0.8,
            num_return_sequences=3
        )

        generated_sentences = []
        for output in outputs:
            decoded_sentence = self.GPT2Tokenizer.decode(
                output, skip_special_tokens=True)
            final_sentence = nltk.sent_tokenize(decoded_sentence)[0]
            generated_sentences.append(final_sentence)

        false_sentence = random.choice(generated_sentences)
        return {'type': 'TF', 'question': 'True or False? ' + false_sentence, 'answer': 'False'}

    def chunk_text(self, text, chunk_size):
        chunks = []
        words = text.split()
        current_chunk = ""

        for word in words:
            if len(current_chunk) + len(word) + 1 <= chunk_size:
                current_chunk += word + " "
            else:
                chunks.append(current_chunk)
                current_chunk = word + " "

        if current_chunk:
            chunks.append(current_chunk)

        return chunks
    
    def predict_sa_mcq(self, text, predict_mcq):

        def chunk_text(text, chunk_size):
            chunks = []
            words = text.split()
            current_chunk = ""

            for word in words:
                if len(current_chunk) + len(word) + 1 <= chunk_size:
                    current_chunk += word + " "
                else:
                    chunks.append(current_chunk)
                    current_chunk = word + " "

            if current_chunk:
                chunks.append(current_chunk)

            return chunks

        output_questions = []
        
        chunked_text = chunk_text(text, 256)
        vectoriser = TfidfVectorizer()
        for chunk in chunked_text:
            no_sentences = len(nltk.sent_tokenize(chunk))
            predicted_questions_sa = self.predict_sa(chunk, no_sentences + 2)

            if predicted_questions_sa:
                # Don't include '?' in sentence
                question_vectors = vectoriser.fit_transform([
                    question['question'][:-1] for question in predicted_questions_sa])
                answer_vectors = vectoriser.fit_transform([
                    question['answer'][:-1] for question in predicted_questions_sa])
                question_similarity_matrix = cosine_similarity(
                    question_vectors)
                answer_similarity_matrix = cosine_similarity(answer_vectors)

                remove_list = []
                # Remove questions too similar to each other
                for i in range(len(predicted_questions_sa)):
                    if i not in remove_list:
                        for j in range(i+1, len(predicted_questions_sa)):
                            if question_similarity_matrix[i][j] > 0.7 or answer_similarity_matrix[i][j] > 0.9:
                                remove_list.append(j)

                sa_questions = [
                    predicted_questions_sa[i] for i in range(len(predicted_questions_sa)) if i not in remove_list]

                # Now try to generate MCQs if enabled
                if predict_mcq:
                    for question in sa_questions:
                        # If only one word in answer we can generate an MCQ,
                        # otherwise leave as it is
                        if len(' '.split(question['answer'])) == 1:
                            predicted_question_mcq = self.predict_mcq(
                                question['question'], question['answer'])
                            if predicted_question_mcq:
                                output_questions.append(predicted_question_mcq)
                            else:
                                output_questions.append(question)
                        else:
                            output_questions.append(question)
        
        return output_questions 

    def predict(self, text):
        predicted_questions = []

        # FIB questions
        fib_questions = self.predict_fib(text)
        if fib_questions:
            predicted_questions += fib_questions

        # SA and MCQ questions
        sa_mcq_questions = self.predict_sa_mcq(text, True)
        if sa_mcq_questions:
            predicted_questions += sa_mcq_questions

        # TF questions
        sentences = nltk.sent_tokenize(text)
        for sent in sentences:
            predicted_question_tf = self.predict_tf(sent)
            if predicted_question_tf:
                predicted_questions.append(predicted_question_tf)

        return predicted_questions
import nltk
nltk.download('punkt')
#import string
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

class Predictor:
    model_dir = "./backendapi/DLModels/checkpoint-2200"
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    #tokenizer = AutoTokenizer.from_pretrained(model_dir, clear_cache=True, local_files_only=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)

    def predict(self, text):
        sentences = nltk.sent_tokenize(text)
        predicted_questions = []
        for sent in sentences:
            inputs = ["summarize: " + sent]
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
                predicted_questions.append({'question': question_answer[0], 'answer': question_answer[1]})
 
        return predicted_questions
class NoGPUPredictor:
    def predict(self, text):
        return [
            {'type': 'SA', 'question': 'Example Question', 'answer': 'Example Answer'},
            {'type': 'MCQ', 'question': 'Example Question', 'answer': 'Distractor 1|Real Answer|Distractor 2|Distractor 3|Real Answer'},
            {'type': 'FIB', 'question': 'Fill in the blank in the following: This is an ______ fill-in-the-blank question', 'answer': 'example'},
            {'type': 'TF', 'question': 'True or False? Example Statement', 'answer': 'True'}
        ]
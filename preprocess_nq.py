import json 
import gzip 
import re

html_remover = re.compile('<.*?>')

def join_tokens(tokens, start, end):
    tokens_to_join = []
    for i in range(start, end + 1):
        tokens_to_join.append(tokens[i]['token'].strip())
    tokens_joined = ' '.join(tokens_to_join)
    return tokens_joined

def clean_question(question_data):
    question = question_data['question_text']

    context_start = question_data['annotations'][0]['long_answer']['start_token']
    context_end = question_data['annotations'][0]['long_answer']['end_token']
    if context_start == -1 or not question_data['annotations'][0]['short_answers']:
        # Long or short answer doesn't exist
        return None 
    
    answer_start = question_data['annotations'][0]['short_answers'][0]['start_token']
    answer_end = question_data['annotations'][0]['short_answers'][0]['end_token']

    tokens = question_data['document_tokens']
    context = join_tokens(tokens, context_start, context_end)
    answer = join_tokens(tokens, answer_start, answer_end)
    # Remove HTML tokens from context and answer
    context_clean = re.sub(html_remover, '', context)
    answer_clean = re.sub(html_remover, '', answer)

    return {'context': context_clean, 'question': question, 'answer': answer_clean}

def read_jsonl_gz(input_file):
    with gzip.open(input_file, 'rt', encoding='utf-8') as jsonl_gz_file:
        for line in jsonl_gz_file:
            yield line.strip()

def decode_jsonl_gz(input_file):
    cleaned_objects = []
    for line in read_jsonl_gz(input_file):
        json_object = json.loads(line)
        cleaned_object = clean_question(json_object)
        if cleaned_object:
            cleaned_objects.append(cleaned_object)

    return cleaned_objects 

def clean_json_objects(json_objects):
    cleaned_objects = []
    print('Total length of JSON object is {}'.format(len(json_objects)))

    for i in range(len(json_objects)):
        print('Cleaning object {} of {}'.format(i + 1, len(json_objects)))
        cleaned_object = clean_question(json_objects[i])
        if cleaned_object:
            cleaned_objects.append(cleaned_object)
    
    return cleaned_objects

def dump_json(output_file, json_objects):
    with open(output_file, 'w') as json_file:
        json.dump(json_objects, json_file)

# Helper function to prepend a zero to file numbers of less than 10
def get_file_number(num):
    if num < 10:
        return '0{}'.format(num)
    else:
        return '{}'.format(num)

def preprocess_sample():
    json_objects = decode_jsonl_gz('NaturalQuestions/v1.0/sample/nq-train-sample.jsonl.gz')
    cleaned_objects = clean_json_objects(json_objects)
    dump_json('NaturalQuestions/v1.0/sample/nq-train-sample.json', cleaned_objects)

def preprocess_train():
    for i in range(50):
        print('Preprocessing file {} of {}'.format(i + 1, 50))
        file_number = get_file_number(i)
        json_objects = decode_jsonl_gz('NaturalQuestions/v1.0/train/nq-train-{}.jsonl.gz'.format(file_number))
        dump_json('NaturalQuestions/v1.0/train/nq-train-{}.json'.format(file_number), json_objects)

def preprocess_dev():
    for i in range(5):
        print('Preprocessing file {} of {}'.format(i + 1, 5))
        file_number = get_file_number(i)
        json_objects = decode_jsonl_gz('NaturalQuestions/v1.0/dev/nq-dev-{}.jsonl.gz'.format(file_number))
        dump_json('NaturalQuestions/v1.0/dev/nq-dev-{}.json'.format(file_number), json_objects)

preprocess_dev()
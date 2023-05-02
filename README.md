# Installation and Running Instructions
## Setup and Installation
* Install Node.js, npm and pipenv.
* From the root directory of the project, `cd` into the `sqfrontend` directory. This contains all of the code for the React frontend.
* Run `npm install` to install the required packages.
* Again from the root directory, `cd` into the `sqbackend` directory. This contains all of the code for the question generation and the Django backend.
* Run `pip install -r requirements.txt` to install the required packages. 
* Install PostgreSQL, create a database `smartquestions` and a user account with the default name (`postgres`) and password `generatequestions`
* Create the database tables by (while in the `sqbackend` directory) running `python manage.py migrate` 

## Running 
* To start the frontend, `cd` into `sqfrontend` and run `npm start`. It should run on `localhost:3000` by default.
* To start the backend, `cd` into `sqbackend` and run `python manage.py runserver`. It should run on `localhost:8000` by default.
* Note that you will need a machine with a GPU that supports CUDA operations in order to run the question generation process. If you do not have such a machine and want to see how the questions are displayed on the frontend, uncomment lines 18 and 141 of `backendapi/views.py`, which are `from .nogpuprediction import NoGPUPredictor` and `predictor = NoGPUPredictor()` respectively, . Then comment lines 17 and 142, which are `from .predictor import Predictor` and `predictor = Predictor()`. `predictor.predict()` for the `NoGPUPredictor` class will always return an example of one of each question type, no matter what the notes text is.
* Alternatively, there is a Jupyter notebook file `predict_questions.ipynb` included in the root directory that can, for example, be run on Google Colab to demonstrate the question generation process. You will need to connect it to a Google drive and upload the SQuAD/NQ model there
* If you are able to run the application with a GPU, you can switch between the SQuAD and NQ models by commenting/uncommenting lines 20 and 21, `model_dir = "./backendapi/DLModels/final-model-squad` and `model_dir = "./backendapi/DLModels/final-model-nq`

## Misc
* There are two files in the root directory: `preprocess_nq.py` and `train_test_t5.ipynb`. The first is the preprocessing script for the NQ dataset, and the second is the training/testing script for the T5 model. These are included for completeness purposes and are not needed to run the application.
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh 'python3 --version'
                sh 'docker --version'
            }
        }

        stage('Create Virtual Environment') {
            steps {
                sh 'python3 -m venv .venv'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '.venv/bin/python -m pip install --upgrade pip'
                sh '.venv/bin/python -m pip install -r requirements.txt'
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh '.venv/bin/python -m pytest tests/test_main.py -v'
            }
        }
    }

    post {
        success {
            echo 'TaskFlow pipeline succeeded!'
        }

        failure {
            echo 'TaskFlow pipeline failed. Check the Console Output.'
        }
    }
}

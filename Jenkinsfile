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

        stage('Install Dependencies') {
            steps {
                sh 'python3 -m pip install --user -r requirements.txt'
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh 'python3 -m pytest tests/test_main.py -v'
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

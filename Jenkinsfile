pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Source Code') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'python3 --version'
                sh 'docker --version'
            }
        }
    }
}

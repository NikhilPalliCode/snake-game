pipeline {
    agent any

    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        SLACK_CHANNEL = '#game-deploys'
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        DEPLOY_DIR = 'snake-game'
    }

    stages {
        stage('Checkout Code') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[url: env.REPO_URL]]
                ])
            }
        }

        stage('Setup Environment') {
            steps {
                bat '''
                    echo "=== System Info ==="
                    node --version
                    npm --version
                    npm install -g vercel@latest
                '''
            }
        }

        stage('Build & Test') {
            steps {
                dir(env.DEPLOY_DIR) {
                    bat '''
                        if exist package.json (
                            npm install
                        ) else (
                            echo No package.json
                        )
                        
                        if exist test\\test.js (
                            npm test
                        ) else (
                            echo No tests configured
                        )
                    '''
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                dir(env.DEPLOY_DIR) {
                    script {
                        try {
                            // Simple deployment without regex parsing
                            bat 'vercel --prod --token %VERCEL_TOKEN% --confirm'
                            
                            // Get URL directly from project file
                            def deploymentUrl = bat(
                                script: 'type .vercel\\project.json | jq -r .url',
                                returnStdout: true
                            )?.trim()
                            
                            currentBuild.description = "Deployed: ${deploymentUrl}"
                            env.DEPLOYMENT_URL = deploymentUrl
                        } catch (err) {
                            slackSend channel: env.SLACK_CHANNEL,
                                      color: 'danger',
                                      message: "❌ DEPLOY FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                            error("Deployment failed")
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            slackSend channel: env.SLACK_CHANNEL,
                      color: 'good',
                      message: "✅ Snake Game deployed: ${env.DEPLOYMENT_URL}"
        }
    }
}
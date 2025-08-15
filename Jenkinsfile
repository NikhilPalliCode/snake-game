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
                sh '''
                    echo "=== System Info ==="
                    node -v
                    npm -v
                    npm install -g vercel@latest
                '''
            }
        }

        stage('Build & Test') {
            steps {
                dir(env.DEPLOY_DIR) {
                    sh '''
                        [ -f package.json ] && npm install || echo "No package.json"
                        [ -f test/test.js ] && npm test || echo "No tests configured"
                    '''
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                dir(env.DEPLOY_DIR) {
                    script {
                        try {
                            // Simplified URL capture
                            def deploymentUrl = sh(
                                script: '''
                                    vercel --prod --token $VERCEL_TOKEN --confirm | grep -o "https://.*\\.vercel\\.app" || true
                                ''',
                                returnStdout: true
                            ).trim()
                            
                            if (!deploymentUrl) {
                                deploymentUrl = sh(
                                    script: '''
                                        cat .vercel/project.json | jq -r .url
                                    ''',
                                    returnStdout: true
                                ).trim()
                            }
                            
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
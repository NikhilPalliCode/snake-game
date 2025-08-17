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
                    echo "Installing Vercel CLI..."
                    npm install -g vercel@latest
                    echo "Adding npm global bin to PATH..."
                    for /f "delims=" %%a in ('npm prefix -g') do set NPM_GLOBAL=%%a
                    set PATH=%PATH%;%NPM_GLOBAL%
                    vercel --version
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
                            // Verify Vercel CLI is available
                            bat 'vercel --version'
                            
                            // Deploy to Vercel
                            def deployOutput = bat(
                                script: 'vercel --prod --token %VERCEL_TOKEN% --confirm',
                                returnStdout: true
                            )
                            
                            // Extract deployment URL from output
                            def deploymentUrl = deployOutput.split('\n').find { it.contains('https://') }?.trim()
                            
                            if (deploymentUrl) {
                                currentBuild.description = "Deployed: ${deploymentUrl}"
                                env.DEPLOYMENT_URL = deploymentUrl
                                echo "✅ Deployment successful: ${deploymentUrl}"
                            } else {
                                error("Failed to extract deployment URL from output")
                            }
                        } catch (err) {
                            echo "❌ DEPLOY FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                            error("Deployment failed: ${err.getMessage()}")
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Snake Game deployed successfully: ${env.DEPLOYMENT_URL}"
        }
        failure {
            echo "❌ Deployment failed - check logs for details"
        }
    }
}
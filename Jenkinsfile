pipeline {
    agent any
    
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        DEPLOY_DIR = 'snake-game'
        // Explicit path to npm (adjust if needed)
        NPM_PATH = 'C:\\Program Files\\nodejs\\npm.cmd'
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
                echo 'Code checked out successfully'
            }
        }
        
        stage('Verify Files') {
            steps {
                dir(env.DEPLOY_DIR) {
                    bat 'dir /B'
                    bat 'if not exist index.html (echo index.html missing! && exit /b 1)'
                    echo 'Basic file verification passed'
                }
            }
        }
        
        stage('Setup Vercel') {
            steps {
                bat """
                    echo "Installing Vercel CLI..."
                    "%NPM_PATH%" install -g vercel@latest
                    echo "Verifying installation..."
                    vercel --version
                """
            }
        }
        
        stage('Deploy to Vercel') {
            steps {
                dir(env.DEPLOY_DIR) {
                    script {
                        try {
                            // Deploy with explicit path if needed
                            def deployOutput = bat(
                                script: 'vercel --prod --token %VERCEL_TOKEN% --confirm',
                                returnStdout: true
                            ).trim()
                            
                            // Parse deployment URL from output
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
        always {
            bat 'vercel logout' // Clean up auth
        }
    }
}
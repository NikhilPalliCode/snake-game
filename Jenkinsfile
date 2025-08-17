pipeline {
    agent any
    
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        SLACK_CHANNEL = '#game-deploys'
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
                bat 'dir /s /b' // Verify directory structure
            }
        }
        
        stage('Verify Files') {
            steps {
                script {
                    def requiredFiles = ['index.html', 'game.js', 'style.css', 'vercel.json']
                    def missingFiles = []
                    
                    requiredFiles.each { file ->
                        if (!fileExists(file)) {
                            missingFiles.add(file)
                        }
                    }
                    
                    if (missingFiles) {
                        error("Missing required files: ${missingFiles.join(', ')}")
                    } else {
                        echo 'All required files present'
                    }
                }
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
                    
                    echo "Verifying installation..."
                    vercel --version
                '''
            }
        }
        
        stage('Deploy to Vercel') {
            steps {
                script {
                    try {
                        // Deploy to Vercel
                        def deployOutput = bat(
                            script: 'vercel --prod --token %VERCEL_TOKEN% --confirm',
                            returnStdout: true
                        ).trim()
                        
                        // Extract deployment URL
                        def deploymentUrl = deployOutput.split('\n').find { 
                            it.contains('https://') && (it.contains('now.sh') || it.contains('vercel.app'))
                        }?.trim()
                        
                        if (deploymentUrl) {
                            currentBuild.description = "Deployed: ${deploymentUrl}"
                            env.DEPLOYMENT_URL = deploymentUrl
                            echo "✅ Deployment successful: ${deploymentUrl}"
                        } else {
                            error("Could not extract deployment URL from output")
                        }
                    } catch (err) {
                        echo "❌ DEPLOY FAILED: ${err.getMessage()}"
                        error("Deployment failed")
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed - cleaning up"
        }
        success {
            echo "✅ Deployment successful: ${env.DEPLOYMENT_URL}"
            // If you install Slack plugin later:
            // slackSend channel: env.SLACK_CHANNEL, 
            //            color: 'good', 
            //            message: "✅ Snake Game deployed: ${env.DEPLOYMENT_URL}"
        }
        failure {
            echo "❌ Pipeline failed - check logs for details"
            // For Slack notifications:
            // slackSend channel: env.SLACK_CHANNEL,
            //            color: 'danger',
            //            message: "❌ DEPLOY FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
    }
}
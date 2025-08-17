pipeline {
    agent any
    
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        // Changed to root directory since snake-game is the main project dir
        WORKING_DIR = '.'
        NPM_PATH = 'npm.cmd' // Or full path like 'C:\\Program Files\\nodejs\\npm.cmd'
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
                
                // Verify directory structure
                bat 'dir /s /b'
            }
        }
        
        stage('Verify Files') {
            steps {
                dir(env.WORKING_DIR) {
                    script {
                        def requiredFiles = ['index.html', 'game.js', 'style.css']
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
        }
        
        stage('Setup Vercel') {
            steps {
                bat """
                    echo "Setting up Vercel CLI..."
                    ${env.NPM_PATH} install -g vercel@latest
                    vercel --version
                """
            }
        }
        
        stage('Deploy to Vercel') {
            steps {
                dir(env.WORKING_DIR) {
                    script {
                        try {
                            // Deploy to Vercel
                            def deployOutput = bat(
                                script: 'vercel --prod --token %VERCEL_TOKEN% --confirm',
                                returnStdout: true
                            ).trim()
                            
                            // Extract deployment URL
                            def deploymentUrl = deployOutput.split('\n').find { 
                                it.contains('https://') && it.contains('now.sh') || it.contains('vercel.app')
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
    }
    
    post {
        always {
            echo "Cleaning up..."
            // No need for vercel logout since we're using --token flag
        }
        success {
            echo "✅ Deployment successful: ${env.DEPLOYMENT_URL}"
        }
        failure {
            echo "❌ Pipeline failed - check logs for details"
        }
    }
}
pipeline {
    agent any
    
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        // This will automatically find npm's global bin directory
        NPM_GLOBAL_BIN = bat(script: 'npm prefix -g', returnStdout: true).trim() + '\\node_modules\\npm\\bin'
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
                bat 'dir /b' // Verify files
            }
        }
        
        stage('Setup Vercel') {
            steps {
                bat """
                    echo "Installing Vercel CLI..."
                    npm install -g vercel@latest
                    echo "Adding npm global bin to PATH..."
                    set PATH=%PATH%;%APPDATA%\\npm
                    vercel --version
                """
            }
        }
        
        stage('Deploy to Vercel') {
            steps {
                script {
                    try {
                        // 1. First try with direct vercel command
                        def deployOutput = bat(
                            script: 'vercel --prod --token %VERCEL_TOKEN% --confirm',
                            returnStdout: true
                        ).trim()
                        
                        // 2. If that fails, try with explicit npm path
                        if (deployOutput.contains("not recognized")) {
                            deployOutput = bat(
                                script: "\"%NPM_GLOBAL_BIN%\\vercel.cmd\" --prod --token %VERCEL_TOKEN% --confirm",
                                returnStdout: true
                            ).trim()
                        }
                        
                        // Extract deployment URL
                        def urlMatcher = deployOutput =~ /(https:\/\/[^\s]+(now\.sh|vercel\.app)[^\s]*)/
                        def deploymentUrl = urlMatcher.find() ? urlMatcher.group(1) : null
                        
                        if (deploymentUrl) {
                            currentBuild.description = "Deployed: ${deploymentUrl}"
                            echo "✅ Success! Deployed to: ${deploymentUrl}"
                        } else {
                            error("Could not extract deployment URL")
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
            echo "Pipeline completed - see logs for details"
        }
    }
}
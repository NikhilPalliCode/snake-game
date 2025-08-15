pipeline {
    agent any

    environment {
        // 1. Configure these in Jenkins credentials
        VERCEL_TOKEN = credentials('vercel-token')
        SLACK_CHANNEL = '#game-deploys'  // Your Slack channel
        
        // 2. Project-specific settings
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        DEPLOY_DIR = 'snake-game'  // Matches your repo name
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
                    
                    echo "Installing Vercel CLI..."
                    npm install -g vercel@latest
                '''
            }
        }

        stage('Build & Test') {
            steps {
                dir(env.DEPLOY_DIR) {
                    sh '''
                        echo "=== Installing Dependencies ==="
                        [ -f package.json ] && npm install || echo "No package.json"
                        
                        echo "=== Running Tests ==="
                        [ -f test/test.js ] && npm test || echo "No tests configured"
                        
                        echo "=== Building Project ==="
                        [ -f build.js ] && npm run build || echo "No build script"
                    '''
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                dir(env.DEPLOY_DIR) {
                    script {
                        try {
                            // Deploy and capture URL
                            def deploymentUrl = sh(
                                script: '''
                                    vercel --prod --token $VERCEL_TOKEN --confirm 2>&1 | tee deploy.log
                                    grep -o 'https://.*\.vercel\.app' deploy.log || echo "https://$(cat .vercel/project.json | jq -r .url)"
                                ''',
                                returnStdout: true
                            ).trim()
                            
                            currentBuild.description = "Deployed: ${deploymentUrl}"
                            env.DEPLOYMENT_URL = deploymentUrl
                            
                        } catch (err) {
                            slackSend channel: env.SLACK_CHANNEL,
                                      color: 'danger',
                                      message: "❌ DEPLOY FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
                            error("Deployment failed")
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Archive useful files
            archiveArtifacts artifacts: '**/deploy.log,**/build/**/*', allowEmptyArchive: true
        }
        success {
            slackSend channel: env.SLACK_CHANNEL,
                      color: 'good',
                      message: """🎮 *Snake Game Deployed!*
                      • <${env.DEPLOYMENT_URL}|Live Demo>
                      • <${env.BUILD_URL}|Build Logs>
                      • Commit: <${env.REPO_URL}/commit/${env.GIT_COMMIT}|${env.GIT_COMMIT.take(8)}>"""
        }
        failure {
            slackSend channel: env.SLACK_CHANNEL,
                      color: 'danger',
                      message: """🚨 *Deployment Failed*
                      • <${env.BUILD_URL}|View Errors>
                      • Branch: master"""
        }
    }
}
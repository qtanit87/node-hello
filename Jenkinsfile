#!groovy?

properties([pipelineTriggers([githubPush()])])
pipeline {

	agent any
	//triggers { pollSCM('* * * * *') }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds()
    }

	environment {
	
		imagename="testing"

	
	}

	stages {
		stage('load env') { 
			
			steps {
					script{				
							
							
							env.appgiturl="https://github.com/qtanit87/node-hello.git"
												
							
							def VERSION = VersionNumber projectStartDate: '', versionNumberString: '${BUILD_DATE_FORMATTED, "yyyy_MM_dd"}_${BUILD_NUMBER}', versionPrefix: ''
							env.DPLVERSION="${VERSION}"																		
							currentBuild.displayName = VERSION
						}
			}
		}
		
		stage('cloning code') { 
			
			steps {
				script {
					
					echo "Checkout hello nodejs Code"
					checkout([$class: 'GitSCM', branches: [[name: "*/${BRANCH}"]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'admin', url: "${appgiturl}"]]])
					
					
					
				}
			}
		} 
		
		stage('Build nodejs code') {
			steps {
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						
						npm install
					'''
				}
			}
    	}

		stage('Build docker image') {
			steps {
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						
						echo -e 'FROM node:10 \nWORKDIR /usr/src/app  \nCOPY package*.json ./ \nRUN npm install \nCOPY . . \nEXPOSE 3000 \nCMD [ "node", "index.js" ]' > Dockerfile

						echo -e "node_modules \nnpm-debug.log " > .dockerignore
						
						docker image rm ${imagename} | true

						docker build -t ${imagename} .
							
					'''
				}
			}
    	}

		stage('upload docker image to aws ecr') {
			steps {
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						
						
						docker tag ${imagename}:latest 688881585294.dkr.ecr.ap-southeast-1.amazonaws.com/${imagename}:latest
						docker push 688881585294.dkr.ecr.ap-southeast-1.amazonaws.com/${imagename}:latest
					'''
				}
			}
    	}
		
	}
	post ('sending email') {
		always {
			script {
					mail bcc: '', body: """
                    Jenkins Job: ${JOB_NAME}
                    Build: $currentBuild.displayName
                    Status: $currentBuild.currentResult
                    Code Change: 
		            App url: 
		    	        example.com
		            
			
                    (Automatic notification - Please don't reply to this email. For further information, please contact DevOps Team)
                    Best Regards, 
                    DevOps Team""", from: 'DevOps@example.com', replyTo: '', subject: "[$currentBuild.currentResult] - [${JOB_NAME}]", to: "thuynh49@dxc.com"

                    
                    
			}
		}
	}
}

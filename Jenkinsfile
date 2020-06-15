#!groovy?

properties([pipelineTriggers([githubPush()])])
pipeline {

	agent any
	
	
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds()
    }

	stages {
		stage('load env') { 
			
			steps {
					load "${WORKSPACE}/env.groovy"
   					echo "${env.service_giturl}"
   					echo "${env.service_gitbranch}"
					script {

							def VERSION = VersionNumber projectStartDate: '', versionNumberString: '${BUILD_DATE_FORMATTED, "yyyy_MM_dd"}_${BUILD_NUMBER}', versionPrefix: ''
							env.DPLVERSION="${VERSION}"																		
							currentBuild.displayName = VERSION
						}
			}
		}
		
		
	


		
		stage('Build nodejs code') {
			steps {
				//using bash script to build node js code with npm
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
				//using bash scripts to create Dockerfile and build docker image with docker commands
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						echo ${env.image_name}
						#create Docker file
						echo -e 'FROM node:10 \nWORKDIR /usr/src/app  \nCOPY package*.json ./ \nRUN npm install \nCOPY . . \nEXPOSE 3000 \nCMD [ "node", "index.js" ]' > Dockerfile
						echo -e "node_modules \nnpm-debug.log " > .dockerignore
						
						#delete old image and create a new image
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
						
						eval $(aws ecr get-login --region ap-southeast-1 --no-include-email --profile testing)
						docker tag ${imagename}:latest 688881585294.dkr.ecr.ap-southeast-1.amazonaws.com/${imagename}:latest
						docker push 688881585294.dkr.ecr.ap-southeast-1.amazonaws.com/${imagename}:latest
					'''
				}
			}
    	}

		stage('deploy docker image to aws ecs cluster') {
			steps {
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						cat index.js
						
						/usr/local/bin/ecs-cli configure profile default --profile-name ecs-cluster
						/usr/local/bin/ecs-cli configure --cluster ecs-cluster --default-launch-type EC2 --config-name ecs-cluster --region ap-southeast-1

						echo -e "version: '3' \nservices: \n  web: \n    image: 688881585294.dkr.ecr.ap-southeast-1.amazonaws.com/testing:latest \n    ports: \n      - \"80:3000\" \n    logging: \n      driver: awslogs \n      options: \n        awslogs-group: ecs-tutorial \n        awslogs-region: ap-southeast-1 \n        awslogs-stream-prefix: web" > docker-compose.yml
						echo -e "version: 1 \ntask_definition: \n  services: \n    web: \n      cpu_shares: 100 \n      mem_limit: 524288000" > ecs-params.yml
						echo -e "{ \n  \"envname\": \"staging\" \n}" > environment.json
						
						#/usr/local/bin/ecs-cli compose service rm --cluster-config ecs-cluster --ecs-profile ecs-cluster
						#sleep 120
						
						#/usr/local/bin/ecs-cli compose service up --cluster-config ecs-cluster --ecs-profile ecs-cluster
						
					'''
				}
			}
    	}
		
	}
	post ('sending email') {
		always {
			//cleanWs()
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

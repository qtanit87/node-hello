#!groovy?

//enable pipeline trigger whenever there is a new commit push to github repository
properties([pipelineTriggers([githubPush()])])
pipeline {

	agent any	
    
    options {
		//maintaining maximum 10 jenkins build log.
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds()
    }

	stages {
		stage('Loading env') { 
			
			steps {
					//loading environment variables from env.groovy file
					load "${WORKSPACE}/env.groovy"
					script {

							def VERSION = VersionNumber projectStartDate: '', versionNumberString: '${BUILD_DATE_FORMATTED, "yyyy_MM_dd"}_${BUILD_NUMBER}', versionPrefix: ''
							env.DPLVERSION="${VERSION}"																		
							currentBuild.displayName = VERSION
						}
			}
		}
		
		
	


		
		stage('Building nodejs code') {
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

		stage('Building docker image') {
			steps {
				//using bash scripts to create Dockerfile and build docker image with docker commands
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						
						#create Docker file
						echo -e 'FROM node:10 \nWORKDIR /usr/src/app  \nCOPY package*.json ./ \nRUN npm install \nCOPY . . \nEXPOSE ${service_port} \nCMD [ "node", "index.js" ]' > Dockerfile
						echo -e "node_modules \nnpm-debug.log " > .dockerignore
						
						#delete old image and create a new image
						echo ${image_name}
						docker image rm ${image_name} | true
						docker build -t ${image_name} .
							
					'''
				}
			}
    	}

		stage('Uploading docker image to aws ecr') {
			steps {
				//using aws cli to login aws profile which is saved on jenkins server
				//using docker commands to tag image with value "latest" and to push docker image to aws ecr
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
						#logging in aws profile
						eval $(aws ecr get-login --region ${aws_region} --no-include-email --profile ${aws_profile})

						#tagging docker image
						docker tag ${image_name}:latest ${ecr_profile}.dkr.ecr.${aws_region}.amazonaws.com/${image_name}:latest

						#pushing docker image to aws ecr
						docker push ${ecr_profile}.dkr.ecr.${aws_region}.amazonaws.com/${image_name}:latest
					'''
				}
			}
    	}

		stage('Deploying docker image to aws ecs cluster') {
			steps {
				script {
					sh returnStdout: true, script: '''
						cd ${WORKSPACE}/
				
						
						/usr/local/bin/ecs-cli configure profile default --profile-name ecs-cluster
						/usr/local/bin/ecs-cli configure --cluster ${ecs_cluster} --default-launch-type EC2 --config-name ecs-cluster --region ${aws_region}

						echo -e "version: '3' \nservices: \n  web: \n    image: ${ecr_profile}.dkr.ecr.${aws_region}.amazonaws.com/${image_name}:latest \n    ports: \n      - \"80:${service_port}\" \n    logging: \n      driver: awslogs \n      options: \n        awslogs-group: ecs-tutorial \n        awslogs-region: ${aws_region} \n        awslogs-stream-prefix: web" > docker-compose.yml
						echo -e "version: 1 \ntask_definition: \n  services: \n    web: \n      cpu_shares: ${ecs_instance_cpu} \n      mem_limit: {${ecs_instance_memory}}" > ecs-params.yml
						echo -e "{ \n  \"envname\": \"${service_gitbranch}\" \n}" > environment.json
						
						cat docker-compose.yml
						cat ecs-params.yml
						cat environment.json

						#/usr/local/bin/ecs-cli compose service rm --cluster-config ${ecs_cluster} --ecs-profile ${ecs_profile}
						#sleep 120
						
						#/usr/local/bin/ecs-cli compose service up --cluster-config ${ecs_cluster} --ecs-profile ${ecs_profile}
						
					'''
				}
			}
    	}
		
	}
	post ('Cleaning up workspace and sending notification email') {
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

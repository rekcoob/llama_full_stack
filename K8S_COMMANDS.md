## Kubernetes Commands for Local Development with minikube

<!-- Apply Changes in k8s -->

kubectl apply -f k8s/

<!-- Restart Frontend -->

docker build -t frontend:local ./frontend
kubectl rollout restart deployment frontend

<!-- Restart Backend -->

docker build -t backend:local ./backend
kubectl rollout restart deployment backend

<!-- Minikube Start -->

minikube start

<!-- Minikube Run Service -->

minikube service frontend
minikube service backend

<!-- Minikube Run Service -->

eval $(minikube docker-env) # veľmi dôležité
docker build -t frontend:local ./frontend

kubectl rollout restart deployment frontend
docker build -t frontend:local ./frontend
minikube service frontend

<!-- Zobrazi beziace pody-->

kubectl get pods

<!-- služby majú správne porty-->

kubectl get svc

kubectl exec -it frontend-6d48cd99d-jzkw2 -- /bin/sh
curl http://backend:8000

kubectl exec -it backend-6464b5468b-ngfwx -- /bin/sh
curl http://ollama:11434

#!/bin/bash

# a terminal tab
# minikube start && minikube dashboard

# another terminal tab
kubectl create -f kubernetes/app/deployment.yaml
kubectl create -f kubernetes/app/servico-aplicacao.yaml
kubectl create -f kubernetes/db/permissoes.yaml
kubectl create -f kubernetes/db/statefulset.yaml
kubectl create -f kubernetes/db/servico-banco.yaml
minikube service servico-aplicacao --url

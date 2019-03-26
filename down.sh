#!/bin/bash

kubectl delete -f kubernetes/app/deployment.yaml
kubectl delete -f kubernetes/app/servico-aplicacao.yaml
kubectl delete -f kubernetes/db/permissoes.yaml
kubectl delete -f kubernetes/db/config-map.yaml
kubectl delete -f kubernetes/db/statefulset.yaml
kubectl delete -f kubernetes/db/servico-banco.yaml
minikube stop

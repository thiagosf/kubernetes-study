# Kubernetes Study

## Cheatsheet

```bash
# ver log do pod (exemplo: log do npm start)
kubectl logs $(kubectl get pods | grep aplicacao | awk '{print $1}') -f

# encaminha porta do banco para acessar com cliente (host: 127.0.0.1)
kubectl port-forward $(kubectl get pods | grep mysql | awk '{print $1}') 3306:3306
```

## Passos para utilizar kubernetes (com minikube)

1. Criar arquivo de configuração do kubernetes (`aplicacao.yaml`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: aplicacao
spec:
  containers:
    - name: container-aplicacao-loja
      image: rafanercessian/aplicacao-loja:v1
      ports:
        - containerPort: 80
```

2. Iniciar minikube:

```bash
minikube start
```

3. Construir imagem do Dockerfile:

```bash
docker build . -t image-aplicacao
```

4. Estabelecer conexão entre cluster (minikube) e o pod (container):

```bash
kubectl create -f aplicacao.yaml
```

5. Verificar se o pod está sendo executado:

```bash
kubectl get pods
```

6. Remove pod para verificar se kubernetes vai criar um novo:

```bash
kubectl delete pods aplicacao
```

7. Verifica se kubernetes criou novo pod:

```bash
kubectl get pods
```

Não foi recriado porque para que o kubernetes gerencie os pods, é preciso usar um `deployment`.

8. Criar aquivo de configuração do deployment (`deployment.yaml`):

```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: aplicacao-deployment
spec:
  template:
    metadata:
      labels:
        name: aplicacao-pod
    spec:
      containers:
        - name: container-aplicacao-loja
          image: rafanercessian/aplicacao-loja:v1
          ports:
            - containerPort: 80
```

9. Criar deployment no cluster:

```bash
kubectl create -f deployment.yaml
```

10. Verificar se o pod está sendo executado:

```bash
kubectl get pods
```

11. Remove pod para verificar se deploymente vai recriar:

```bash
kubectl delete pods aplicacao-deployment-123
```

12. Verifica se kubernetes criou novo pod:

```bash
kubectl get pods
```

13. Verificar endereço IP do pod em execução:

```bash
kubectl describe pods | grep IP
```

Não foi possível conectar! Pois é preciso mapear as portas.

14. Usar dashboard com minikube:

```bash
minikube dashboard
```

15. Escalonar aplicação para aumentar número de réplicas do pod:

- Workloads
- Deployments
- Botão ações `Scale`

16. Verifica IPs novamente:

```bash
kubectl describe pods | grep IP
```

Cada pod fica com um IP diferente.

17. Criar `service` (balenceador de carga) para abstrair acesso aos pods (`servico-aplicacao.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: servico-aplicacao
spec:
  type: LoadBalancer
  ports:
    - port: 80
  selector:
    name: aplicacao-pod
```

18. Criar service no cluster:

```bash
kubectl create -f servico-aplicacao.yaml
```

19. Verificar url de acesso:

```bash
minikube service servico-aplicacao --url
```

20. Organizar arquivos de configuração com estrturura:

- app
  - aplicacao.yaml
  - deployment.yaml
  - servico-aplicacao.yaml
- db
  - pod-banco.yaml
  - statefulset.yaml
  - permissoes.yaml
  - servico-banco.yaml

21. Criar arquivo de configuração do pod do banco de dados (`db/pod-banco.yaml`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql
spec:
  containers:
    - name: container-mysql
      image: mysql
      ports:
        - containerPort: 3306
      env:
        - name: MYSQL_DATABASE
          value: "loja"
        - name: MYSQL_USER
          value: "root"
        - name: MYSQL_ALLOW_EMPTY_PASSWORD
          value: "1"
```

22. Criar objeto `StatefulSet` para persistir dados do banco, mapeando o volume do pod para um local externo (`db/statefulset.yaml`):

```yaml
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: statefulset-mysql
spec:
  serviceName: db
  template:
    metadata:
      labels:
        name: mysql
    spec:
      containers:
        - name: container-mysql
          image: mysql
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_DATABASE
              value: "loja"
            - name: MYSQL_USER
              value: "root"
            - name: MYSQL_ALLOW_EMPTY_PASSWORD
              value: "1"
          volumeMounts:
            - name: volume-mysql
              mountPath: /var/lib/mysql
      volumes:
        - name: volume-mysql
          persistentVolumeClaim:
            claimName: configuracao-mysql
```

23. Criar aquivo com permissões do volume (`db/permissoes.yaml`):

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: configuracao-mysql
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
```

24. Serviço do banco (`db/servico-banco.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  type: ClusterIP
  ports:
    - port: 3306
  selector:
    name: mysql
```

25. Criar permissões para acesso ao volume:

```bash
kubectl create -f permissoes.yaml
```

26. Criar statefulset no cluster:

```bash
kubectl create -f statefulset.yaml
```

27. Criar servico do banco no cluster:

```bash
kubectl create -f servico-banco.yaml
```

28. Verificar pods sendo executados:

```bash
kubectl get pods
```

29. Acessar pod do mysql para criar tabelas:

```bash
kubectl exec -it statefulset-mysql-0 sh
```

30. Verificar url da aplicação:

```bash
minikube service servico-aplicacao --url
```

31. Done!

## Usando Google Cloud

1. Criar projeto
2. Ir para API overview
3. Habilitar `Google Container Engine API`
4. Criar cluster no dashboard do Google
5. Container Engine > Create Cluster
6. Clicar em `Connect` do cluster criado e copiar linha de comando iniciado por `gcloud`
7. Executar comando para verificar se está apontando para cluster do Google:

```bash
kubectl config get-contexts
```

8. Confirmar que não tem pods sendo executados no cluster externo:

```bash
kubectl get pods
```

9. Duplicar arquivos de configuração (`*.yaml`) para modificar com dados específicos de produção:

```bash
mkdir prod && cp -r app prod && cp -r db prod
```

10. Especificar versão 5.5 do mysql no arquivo `statefulset.yaml`
11. Executar `kubectl create` de todos arquivos `*.yaml` da mesma forma que local
12. Escalonar com linha de comando:

```bash
kubectl scale deployment aplicacao-deployment --replicas=3
```

13. Criar tabelas no banco da mesma forma que local
14. Verificar endereço IP no cluster do Google (mesma forma que local)

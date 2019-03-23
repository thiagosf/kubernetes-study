# Kubernetes Study

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

3. Estabelecer conexão entre cluster (minikube) e o pod (container):

```bash
kubectl create -f aplicacao.yaml
```

4. Verificar se o pod está sendo executado:

```bash
kubectl get pods
```

5. Remove pod para verificar se kubernetes vai criar um novo:

```bash
kubectl delete pods aplicacao
```

6. Verifica se kubernetes criou novo pod:

```bash
kubectl get pods
```

Não foi recriado porque para que o kubernetes gerencie os pods, é preciso usar um `deployment`.

7. Criar aquivo de configuração do deployment (`deployment.yaml`):

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

8. Criar deployment no cluster:

```bash
kubectl create -f deployment.yaml
```

9. Verificar se o pod está sendo executado:

```bash
kubectl get pods
```

10. Remove pod para verificar se deploymente vai recriar:

```bash
kubectl delete pods aplicacao-deployment-123
```

11. Verifica se kubernetes criou novo pod:

```bash
kubectl get pods
```

12. Verificar endereço IP do pod em execução:

```bash
kubectl describe pods | grep IP
```

Não foi possível conectar! Pois é preciso mapear as portas.

13. Usar dashboard com minikube:

```bash
minikube dashboard
```

14. Escalonar aplicação para aumentar número de réplicas do pod:

- Workloads
- Deployments
- Botão ações `Scale`

15. Verifica IPs novamente:

```bash
kubectl describe pods | grep IP
```

Cada pod fica com um IP diferente.

16. Criar `service` (balenceador de carga) para abstrair acesso aos pods (`servico-aplicacao.yaml`):

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

17. Criar service no cluster:

```bash
kubectl create -f servico-aplicacao.yaml
```

18. Verificar url de acesso:

```bash
minikube service servico-aplicacao --url
```

19. Organizar arquivos de configuração com estrturura:

- app
  - aplicacao.yaml
  - deployment.yaml
  - servico-aplicacao.yaml
- db
  - pod-banco.yaml
  - statefulset.yaml
  - permissoes.yaml
  - servico-banco.yaml

20. Criar arquivo de configuração do pod do banco de dados (`db/pod-banco.yaml`):

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

21. Criar objeto `StatefulSet` para persistir dados do banco, mapeando o volume do pod para um local externo (`db/statefulset.yaml`):

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

22. Criar aquivo com permissões do volume (`db/permissoes.yaml`):

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

23. Serviço do banco (`db/servico-banco.yaml`):

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

24. Criar statefulset no cluster:

```bash
kubectl create -f statefulset.yaml
```

25. Criar servico do banco no cluster:

```bash
kubectl create -f servico-banco.yaml
```

26. Criar permissões para acesso ao volume:

```bash
kubectl create -f permissoes.yaml
```

27. Verificar pods sendo executados:

```bash
kubectl get pods
```

28. Acessar pod do mysql para criar tabelas:

```bash
kubectl exec -it statefulset-mysql-0 sh
```

29. Verificar url da aplicação:

```bash
minikube service servico-aplicacao --url
```

30. Done!

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

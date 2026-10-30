# Correr mongo en un contenedor

```bash
docker run -d  --name mongodb  -p 27017:27017 -v "data/mongodb:/data/db" --restart unless-stopped mongo:8
```
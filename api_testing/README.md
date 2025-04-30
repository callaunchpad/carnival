
## cog installation

```bash
sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
sudo chmod +x /usr/local/bin/cog
```

## cog push

```bash
cog login
cog push r8.im/<your-username>/<your-model-name>
```

## prediction

to predict with cog, run

```bash
cog predict -i <args>
```
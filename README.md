# git.in(teractive)

An interactive Git CLI for commonly annoying git workflows.

### Currently supported flows

1. Checkout
2. Delete (multiselect)

### Install

```bash
npm i -g @jawang94/git.in
```

### Usage

```txt
- gci = interactively checkout a new branch
- gdi = interactively delete branches (multiselect)
```

```bash
- `gci | gdi` List all local branches
- `gci | gdi -a` List all available branches
- `gci | gdi -r` List remote branches only
- `gci | gdi -h` Shows help message
```

![image](https://user-images.githubusercontent.com/1926029/56238297-11153f00-6086-11e9-93b7-fe22800e0056.png)

### Usage
```bash
docker run -d \
  --name selenium \
  -p 4444:4444 \        # WebDriver ui
  -p 7900:7900 \        # noVNC ui
  --shm-size=2g \       # prevents cannot allocate shm crashes
  selenium/standalone-chrome:latest
```

### TODOs
- [x] MVP
- [ ] Dockerize tasks, networking test with Selenium grid
- [ ] Scaling test
build: node_modules
	mkdir -p dist
	webpack --mode development
	cp src/index.html dist/index.html
	cp src/bird.jpg dist/bird.jpg


node_modules:
	npm install


clean:
	rm -rf dist


distclean: clean
	rm -rf node_modules

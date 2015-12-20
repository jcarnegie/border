ESLINT := node_modules/.bin/eslint

# SRC = $(wildcard src/*.js src/**/*.js)
SRC = $(shell find src -name "*.js")
LIB = $(SRC:src/%.js=lib/%.js)
BINSRC = $(wildcard bin-src/*.js)
BIN = $(BINSRC:bin-src/%.js=bin/%.js)

all: lib bin

lib: $(LIB)
lib/%.js: src/%.js
	mkdir -p $(@D)
	babel $< -o $@

bin: $(BIN)
bin/%.js: bin-src/%.js
	mkdir -p $(@D)
	babel $< -o $@

clean:
	rm -rf bin lib

lint:
	@$(ESLINT) src test

test: lib bin lint test-unit

test-unit:
	mocha -c --compilers js:babel-register ./test/**/*.js

bootstrap:	modules
	@$(MAKE)	\
		generator-self	

modules:
	yarn	install

generator-self:
	yarn	build
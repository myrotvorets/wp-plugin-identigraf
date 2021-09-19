DOMAIN_FE    := i8f
DOMAIN_BE    := i8fa
DOMAIN_JS    := i8fjs
PO_FILES_FE  := $(wildcard $(DOMAIN_FE)-*.po)
PO_FILES_BE  := $(wildcard $(DOMAIN_BE)-*.po)
PO_FILES_JS  := $(wildcard $(DOMAIN_JS)-*.po)
MO_FILES_FE  := $(patsubst %.po,%.mo,$(PO_FILES_FE))
MO_FILES_BE  := $(patsubst %.po,%.mo,$(PO_FILES_BE))
JSON_FILES   := $(patsubst %.po,%.json,$(PO_FILES_JS))

POT_FE       := $(DOMAIN_FE).pot
POT_BE       := $(DOMAIN_BE).pot
POT_JS       := $(DOMAIN_JS).pot

MSGFMT       := msgfmt
MSGMERGE     := msgmerge

.PHONY: all clean

all: $(POT_FE) $(POT_BE) $(POT_JS) $(MO_FILES_FE) $(MO_FILES_BE) $(JSON_FILES)

$(POT_FE):
	"$(CURDIR)/../vendor/bin/wp" i18n make-pot "$(CURDIR)/../" "$(CURDIR)/../lang/$(POT_FE)" --domain="$(DOMAIN_FE)" --skip-js

$(POT_BE):
	"$(CURDIR)/../vendor/bin/wp" i18n make-pot "$(CURDIR)/../" "$(CURDIR)/../lang/$(POT_BE)" --domain="$(DOMAIN_BE)" --skip-js

$(MO_FILES_FE): $(PO_FILES_FE)
$(MO_FILES_BE): $(PO_FILES_BE)

%.mo: %.po
	$(MSGFMT) -o$@ $<

%.json: %.po
	npx po2json "$^" > "$@"

$(PO_FILES_FE): %: $(POT_FE)
	$(MSGMERGE) -U "$@" $(POT_FE)
	touch "$@"

$(PO_FILES_BE): %: $(POT_BE)
	$(MSGMERGE) -U "$@" $(POT_BE)
	touch "$@"

$(PO_FILES_JS): %: $(POT_JS)
	$(MSGMERGE) -U "$@" $(POT_JS)
	touch "$@"

clean:
	-rm -f $(POT_FE) $(POT_BE) $(MO_FILES_FE) $(MO_FILES_BE) $(JSON_FILES)

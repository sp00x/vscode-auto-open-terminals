# auto-open-terminals README

Configurable sets of terminal windows to automatically open, based on workspace folders.

## Features

TBD.

## Requirements

TBD.

## Extension Settings

Configure in the workspace settings file:

Example:
```
{
	"folders": [
    // ...
	],
	"settings": {
		"auto-open-terminals.configurations": [
			{
				"name": "main",
				"command": "npm run watch",
				"folders": {
					"ts-cg-common": {},
					"ts-cg-client": { "delay": 10000 },
					"ts-cg-server": { "delay": 10000 },
					"ts-cg-cli": { "delay": 10000 }
				}
			},
			{
				"name": "vue",
				"command": "npm run watch",
				"folders": [
					"vue-cg-admin-ui",
					"vue-cg-controller-ui",
					"vue-cg-components",
					"vue-util-components"
				]
			}
		]
	}
}
```

## Known Issues

TBD.

## Release Notes

TBD.

# ![Bot Framework SDK v4 Python](./doc/media/FrameWorkPython.png)

## Gitpod 

https://gitpod.io/#github.com/adilshehzad786/Healthtech-Bot-StartHack-EU

## Activating Python Virtual Environments

``
python3 -m venv venv

source venv/bin/activate

``
## Git & GitHub Basics 

``
git add . 

git commit -m " Your message"

git branch your-name_dev

git checkout your-name_dev

git branch -M your-name_dev

git push -u origin your-name_dev

``

### [What's new with Bot Framework](https://docs.microsoft.com/en-us/azure/bot-service/what-is-new?view=azure-bot-service-4.0)

This repository contains code for the Python version of the [Microsoft Bot Framework SDK](https://github.com/Microsoft/botframework-sdk), which is part of the Microsoft Bot Framework - a comprehensive framework for building enterprise-grade conversational AI experiences.

This SDK enables developers to model conversation and build sophisticated bot applications using Python. SDKs for [JavaScript](https://github.com/Microsoft/botbuilder-js), [.NET](https://github.com/Microsoft/botbuilder-dotnet) and [Java (preview)](https://github.com/Microsoft/botbuilder-java) are also available.

To get started building bots using the SDK, see the [Azure Bot Service Documentation](https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0).

For more information jump to a section below.

* [Build status](#build-status)
* [Packages](#packages)
* [Getting started](#getting-started)
* [Getting support and providing feedback](#getting-support-and-providing-feedback)
* [Contributing and our code of conduct](contributing-and-our-code-of-conduct)
* [Reporting security issues](#reporting-security-issues)

## Build Status

| Branch | Description        | Build Status | Coverage Status | Code Style |
 |----|---------------|--------------|-----------------|--|
| Main | 4.12.* Preview Builds | [![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/Python/Python-CI-PR-yaml?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=771&branchName=main) | [![Coverage Status](https://coveralls.io/repos/github/microsoft/botbuilder-python/badge.svg?branch=HEAD)](https://coveralls.io/github/microsoft/botbuilder-python?branch=HEAD) | [![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black) |

## Packages

| Build | Released Package |
 |----|---------------|
| botbuilder-ai | [![PyPI version](https://badge.fury.io/py/botbuilder-ai.svg)](https://pypi.org/project/botbuilder-ai/) |
| botbuilder-applicationinsights | [![PyPI version](https://badge.fury.io/py/botbuilder-applicationinsights.svg)](https://pypi.org/project/botbuilder-applicationinsights/) |
| botbuilder-azure | [![PyPI version](https://badge.fury.io/py/botbuilder-azure.svg)](https://pypi.org/project/botbuilder-azure/) |
| botbuilder-core | [![PyPI version](https://badge.fury.io/py/botbuilder-core.svg)](https://pypi.org/project/botbuilder-core/) |
| botbuilder-dialogs | [![PyPI version](https://badge.fury.io/py/botbuilder-dialogs.svg)](https://pypi.org/project/botbuilder-dialogs/) |
| botbuilder-schema | [![PyPI version](https://badge.fury.io/py/botbuilder-schema.svg)](https://pypi.org/project/botbuilder-schema/) |
| botframework-connector | [![PyPI version](https://badge.fury.io/py/botframework-connector.svg)](https://pypi.org/project/botframework-connector/) |

## Getting Started
To get started building bots using the SDK, see the [Azure Bot Service Documentation](https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0).

The [Bot Framework Samples](https://github.com/microsoft/botbuilder-samples) includes a rich set of samples repository.

If you want to debug an issue, would like to [contribute](#contributing-code), or understand how the Bot Builder SDK works, instructions for building and testing the SDK are below.

### Prerequisites
- [Git](https://git-scm.com/downloads)
- [Python 3.8.2](https://www.python.org/downloads/)

Python "Virtual Environments" allow Python packages to be installed in an isolated location for a particular application, rather than being installed globally, as such it is common practice to use them. Click [here](https://packaging.python.org/tutorials/installing-packages/#creating-virtual-environments) to learn more about creating _and activating_ Virtual Environments in Python.

### Clone
Clone a copy of the repo:
```bash
git clone https://github.com/Microsoft/botbuilder-python.git
```
Change to the SDK's directory:
```bash
cd botbuilder-python
```

### Using the SDK locally

To use a local copy of the SDK you can link to these packages with the pip -e option.

```bash
pip install -e ./libraries/botbuilder-schema
pip install -e ./libraries/botframework-connector
pip install -e ./libraries/botbuilder-core
pip install -e ./libraries/botbuilder-integration-aiohttp
pip install -e ./libraries/botbuilder-ai
pip install -e ./libraries/botbuilder-applicationinsights
pip install -e ./libraries/botbuilder-integration-applicationinsights-aiohttp
pip install -e ./libraries/botbuilder-dialogs
pip install -e ./libraries/botbuilder-azure
pip install -e ./libraries/botbuilder-adapters-slack
pip install -e ./libraries/botbuilder-testing
```

### Running unit tests
First execute the following command from the root level of the repo:
```bash
pip install -r ./libraries/botframework-connector/tests/requirements.txt
pip install -r ./libraries/botbuilder-core/tests/requirements.txt
pip install -r ./libraries/botbuilder-ai/tests/requirements.txt
```

Then enter run pytest by simply typing it into your CLI:

```bash
pytest
```

This is the expected output:
```bash

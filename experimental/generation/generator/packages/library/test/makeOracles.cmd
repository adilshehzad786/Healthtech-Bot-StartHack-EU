@echo off
setlocal

call lerna run build
set ds=..\..\cli\bin\run

call node %ds% dialog:generate:test transcripts/sandwich.transcript sandwich -o oracles
call node %ds% dialog:generate:test transcripts/addItemWithButton.transcript msmeeting-actions -o oracles
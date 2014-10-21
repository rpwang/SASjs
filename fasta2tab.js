#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var cli = require('cli').enable('status');
var appversion = "0.1 - created by Rui-Peng Wang."; 

cli.parse({
	log:	['l', 'Enable logging'],
	fasta:	['f', 'Fasta file from PATH','path'],
	version:['v', 'Display version number']
});

cli.main(function (args, options){
	if (options.version){
		cli.info('Version:'+appversion);
	}
	else if (options.fasta){
		var instream = fs.createReadStream(options.fasta);
		var outstream = new stream;
		var readlineStream = readline.createInterface(instream,outstream);
		
		var int_seq = 0;
		var str_seq = " ";
		readlineStream.on('line',function(line){
				if(line.charAt(0) == '>'){
					if (str_seq.length == 1 ){
						process.stdout.write(line+"\t");
						str_seq = "";
					}
					else if(str_seq.length != 0){
						process.stdout.write(str_seq+"\n");
						process.stdout.write(line+"\t");
						str_seq = "";
					}
				}
				else{
					str_seq=str_seq+line;
				}
		});
		readlineStream.on('close',function(){
			process.stdout.write(str_seq+"\n");
			cli.ok("Process finished!");
		});
	}
	else{
		cli.error("Incorrect parameters have been provided see --help.");
	}	
});

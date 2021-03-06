#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var cli = require('cli').enable('status');
var appversion = "0.1 - created by Rui-Peng Wang"; 

cli.parse({
	log:	['l', 'Enable logging'],
	fasta:	['f', 'Input fasta file from PATH','path'],
	//seqinfo:['s', 'Enable sequences readlength info'],
	version:['v', 'Display version number']
});

//get function to result statistic of a set of sequence lengths
function getNstats(Nsize, seqLength, totalBasesWithN){
	var int_Nsize = Nsize;
	var arr_seqLength = seqLength;
	var int_totalBasesWithN = totalBasesWithN;

	var int_totalSeqLength = 0;
	var int_nsize= 0
	var int_lsize;
	var arr_Nstats = [];
	for (var i =0; i < arr_seqLength.length; i++){
		if (int_totalSeqLength <= (int_totalBasesWithN*int_Nsize)){
			int_totalSeqLength = int_totalSeqLength + arr_seqLength[i];
			int_nsize++;
			int_lsize = arr_seqLength[i];
		}
		else{
			arr_Nstats.push(int_nsize);
			arr_Nstats.push(int_lsize); 
			return arr_Nstats; 
		}
	}	
};

cli.main(function (args, options){
	if (options.version){
		cli.info('Version:'+appversion);
	}	
	else if (options.fasta){
		var instream = fs.createReadStream(options.fasta);
		var outstream = new stream;
		var readlineStream = readline.createInterface(instream,outstream);
	
		var int_numSeqs=0;
		var int_totalBasesWithN=0;
		var int_totalBasesWithoutN=0;
	
		var int_n50 = 0;	
		var int_l50;
		var int_n90 = 0;
		var int_l90;
	
		var int_seq = 0;
		var str_seq = " ";
		
		var arr_seqLength = new Array();
		var arr_lengthN = new Array();
		var arr_countN = new Array();
		// regex string for matching undetermiend nuc base
		var re_checkNs = new RegExp("[Nn]","g");

		readlineStream.on('line',function(line){
				if(line.charAt(0) == '>'){
					int_numSeqs++;
					if (str_seq.length == 1 ){
						process.stdout.write("name:"+line+"\t");
						str_seq = "";
					}
					else if(str_seq.length != 0){	
						arr_countN  = str_seq.match(re_checkNs);
						if (!arr_countN){
							arr_countN = "";
						}
						process.stdout.write("length:"+str_seq.length+"\tlength without Ns:"+(str_seq.length-arr_countN.length)+"\n");
						arr_seqLength.push(str_seq.length);
						arr_lengthN.push(arr_countN.length);
						process.stdout.write("name:"+line+"\t");
						str_seq = "";
					}
				}
				else{
					str_seq=str_seq+line;
				}
		});
		readlineStream.on('close',function(){
			arr_countN  = str_seq.match(re_checkNs);
			if (!arr_countN){
				arr_countN = "";
			}
	                process.stdout.write("length:"+str_seq.length+"\tlength without Ns:"+(str_seq.length-arr_countN.length)+"\n")
			arr_seqLength.push(str_seq.length);
			arr_lengthN.push(arr_countN.length);
			arr_seqLength.sort(function(a,b){return b-a});
			// Call the reduce method, starting with an initial value of 0. 
			int_totalBasesWithN = arr_seqLength.reduce(function(bases,total){
				return total + bases;
			}, 0);

			var int_totalNs = arr_lengthN.reduce(function(bases,total){
				return total+bases;
			}, 0);
			int_totalBasesWithoutN = int_totalBasesWithN-int_totalNs;

			// getting n50 and l50	
			var arr_N50 = getNstats(0.5,arr_seqLength,int_totalBasesWithN);
			process.stdout.write("N50: "+arr_N50[0]+"\n");
			process.stdout.write("L50: "+arr_N50[1]+"\n");
			
			// getting n90 and l90
			var arr_N90 = getNstats(0.9,arr_seqLength,int_totalBasesWithN);
			process.stdout.write("N90: "+arr_N90[0]+"\n");
			process.stdout.write("N90: "+arr_N90[1]+"\n");
 			
 
			process.stdout.write("numSeqs: "+int_numSeqs+"\n");
		 	process.stdout.write("total basesWithN: "+int_totalBasesWithN+"\n");	
			process.stdout.write("total basesWithoutN: "+int_totalBasesWithoutN+"\n");
			cli.ok("Process finished!");
		});			
	}
	else{
		cli.error("Incorrect parameters have been provided see --help");
	}	
});

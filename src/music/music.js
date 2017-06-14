const Discord = require('discord.js');
const search = require('youtube-search');
const config = require('../config.json');
const opts = { maxResults: 1, key: config.googletoken };
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
var dispatcher = { destroyed: true };
var queue = [];
var rpc = false;
var msg = [];
exports.play = (message, command, bot) => {
	let voice = message.member.voiceChannel;
	if(!voice) return failed(message, "You have to be in a voice channel to use this commmand");
	
	search(command.split(' ').slice(1).join(' '), opts, function(err, results) {
	  if(err) return console.log(err);
		 
		  console.dir(results);
		
		if(!dispatcher.destroyed)
		{
			message.channel.send({embed: {description:`Queueing [${results[0].title}](${results[0].link})`, thumbnail:results[0].thumbnails.default}});
			console.log(queue);  
			return queue[queue.length] = results[0];
		}
		plsplay(message, results[0], voice);	
	})
};

function plsplay(message, results, voice) {
	voice.join().then(connection => {
		queue[0] = results;
		var stream = ytdl(results.link, { filter : 'audioonly' });
		dispatcher = connection.playStream(stream, streamOptions)
		message.channel.send({embed: {description:`Playing [${results.title}](${results.link})`, thumbnail:results.thumbnails.default}}).then(m => msg = m[0]);
	dispatcher.on("end", end => {	
	console.log(msg);
	if(msg)
	{
		if(msg[0]) msg[0].delete();
		if(msg[1]) msg[1].delete();
	}
	message.channel.send({embed: {description:`Finished [${results.title}](${results.link})`, thumbnail:results.thumbnails.default}}).then(m => msg = m[1]);
	console.log("end of song "+queue[0].name + "end reason: "+end);
	if(!rpc && end != "skipped")
		queue = queue.slice(1);
	plsplay(message, queue[0], voice);
	});
	}).catch(console.error);
}

exports.queue = (message) => {
	if(queue.length == 0) return message.channel.send({embed: {description:`Queue is empty`}});
	let embed = new Discord.RichEmbed();
	let len = (queue > 11) ? 11 : queue.length;
	embed.addField(`Now playing`,`[${queue[0].title}](${queue[0].link})`);
	embed.setThumbnail(queue[0].thumbnails.default.url);
	for( i = 1; i < len ; i++)
	{
		embed.addField(`${i}`,`[${queue[i].title}](${queue[i].link})`);
		console.log(i + " - " + queue[i].title + queue[i].link + queue[i].channelTitle);//};
	}
	message.channel.send({embed});
}
exports.skip = (message) => { 
	if(dispatcher.destroyed) return;
	message.channel.send({embed: {description:`skipped [${queue[0].title}](${queue[0].link})`, thumbnail: queue[0].thumbnails.default}})
	.then(queue = queue.slice(1)).then(dispatcher.end("skipped"));
};

exports.np = (message) => {
	message.channel.send({embed: {description:`Now playing [${queue[0].title}](${queue[0].link})`, thumbnail: queue[0].thumbnails.default}});
};

exports.destroy = (message) => {
	if(dispatcher.destroyed) return;
	queue = [];
	dispatcher.end("skipped");
	message.channel.send({embed: {description:`Deleted queue`}});
};

exports.rpc = (message) => {
	rpc = !rpc;
	console.log("Repeat current song now "+rpc);
	message.channel.send({embed: {description:`Toggled repeating of current song, currently: ${(rpc) ? "on" : "off"}`}});
};

function failed(message, reasons) {
	var content = message.cleanContent;
	console.log("Usage of '"+content+"' unsuccessful. Reason(s): "+reasons);
	var embed = new Discord.RichEmbed();
		embed.addField("Usage of '"+content+"' unsuccessful",reasons);
		embed.setColor("FF3333");
		message.channel.send({embed})
}
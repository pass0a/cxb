let str = '{JAVA_HOME}/......';
str = str.replace(/\{([a-zA-Z0-9_-]+)\}/g, (str: string, ...args: any[]): string => {
	let key = process.env[args[0]] || 'undefined';
	return key;
});
console.log(str);

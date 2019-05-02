// IDEA: DISCLAIMER: Most of this code follows the tutorial code samples from https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b except the 'pause' event which is for pausing the recording feature.
export const recordAudio = () =>
	new Promise(async resolve => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const mediaRecorder = new MediaRecorder(stream);
		const audioChunks = [];

		mediaRecorder.addEventListener("dataavailable", event => {
			audioChunks.push(event.data);
		});

		const start = () => mediaRecorder.start();

		// This one is my own add-on.
		const pause = () => {
			mediaRecorder.pause();
		};
		const resume = () => mediaRecorder.resume();

		const stop = () =>
			new Promise(resolve => {
				mediaRecorder.addEventListener("stop", () => {
					const audioBlob = new Blob(audioChunks);
					const audioUrl = URL.createObjectURL(audioBlob);
					const audioObj = new Audio(audioUrl);
					const play = () => audio.play();
					let currentTime = audioObj.currentTime;
					resolve({ audioBlob, audioUrl, audioObj, currentTime, play });
				});
				mediaRecorder.stop();
			});

		resolve({ start, pause, resume, stop });
	});

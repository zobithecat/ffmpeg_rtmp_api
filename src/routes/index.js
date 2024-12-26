const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');

const streams = {};

async function pushStream(inputFile, rtmpUrl, rtmpStreamKey, loopCount = -1) {
    const outputUrl = `${rtmpUrl}/${rtmpStreamKey}`;

    console.log(`Starting to stream to ${outputUrl}`);

    ffmpeg(inputFile)
        .inputOptions([
            `-stream_loop ${loopCount}`,     // Loop the input video
        ])
        .outputOptions([
            '-c:v libx264',        // Video codec
            '-preset ultrafast',    // Encoding speed (trade-off with quality)
            '-maxrate 1000k',      // Max bitrate
            '-bufsize 2000k',      // Buffer size
            '-pix_fmt yuv420p',    // Pixel format
            '-g 30',               // GOP (Group of Pictures)
            '-c:a aac',            // Audio codec
            '-b:a 128k',           // Audio bitrate
            '-ar 44100',           // Audio sampling rate
            '-f flv',              // Format for RTMP
        ])
        .output(outputUrl)
        .on('start', (commandLine) => {
            console.log('FFmpeg command: ', commandLine);
        })
        .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent}% done`);
        })
        .on('error', (err, stdout, stderr) => {
            console.error('Error: ', err.message);
            console.error('FFmpeg stderr: ', stderr);
        })
        .on('end', () => {
            console.log('Streaming finished!');
        })
        .run();
}

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

router.get('/rtmp', (req, res) => {
    const { rtmpUrl, rtmpStreamKey, loopCount } = req.query;
    if (!rtmpUrl || !rtmpStreamKey) {
        return res.status(400).json({
            error: 'Missing required parameters: rtmpUrl and rtmpStreamKey',
        });
    }
    console.log("videoPath:", __dirname + '/videos/counting_1_min.mp4')
    pushStream(__dirname + '/counting_1_min.mp4', "rtmp://" + rtmpUrl, rtmpStreamKey, loopCount || -1);

    res.json({
        message: 'Parameters received successfully',
        rtmpUrl,
        rtmpStreamKey,
    });
});

router.post('/rtmp', (req, res) => {
    const { rtmpUrl, rtmpStreamKey, loopCount } = req.body;

    if (!rtmpUrl || !rtmpStreamKey) {
        return res.status(400).json({
            error: 'Missing required parameters: rtmpUrl and rtmpStreamKey',
        });
    }

    console.log("videoPath:", __dirname + '/videos/counting_1_min.mp4');
    pushStream(
        __dirname + '/counting_1_min.mp4', // Path to your video file
        rtmpUrl,                     // RTMP server URL
        rtmpStreamKey,                           // Stream key
        loopCount || -1                          // Default to -1 if not provided
    );

    res.json({
        message: 'Parameters received successfully',
        rtmpUrl,
        rtmpStreamKey,
    });
});

module.exports = router;
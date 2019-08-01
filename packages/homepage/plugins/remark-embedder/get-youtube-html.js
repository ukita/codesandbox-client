const { URL } = require('url');

const shouldTransform = string => {
  const { host } = new URL(string);

  return host.endsWith('youtube.com') || host.endsWith('youtu.be');
};

const getTimeValueInSeconds = timeValue => {
  if (Number(timeValue).toString() === timeValue) {
    return timeValue;
  }

  const { 2: hours = '0', 4: minutes = '0', 6: seconds = '0' } =
    timeValue.match(/((\d*)h)?((\d*)m)?((\d*)s)?/) || [];

  return String((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds));
};
const getYouTubeIFrameSrc = string => {
  const url = new URL(string);
  let id = url.searchParams.get('v');
  if (url.host === 'youtu.be') {
    id = url.pathname.slice(1);
  }
  const embedUrl = new URL(
    `https://www.youtube-nocookie.com/embed/${id}?rel=0`
  );
  url.searchParams.forEach((value, name) => {
    if (name === 'v') {
      return;
    }

    if (name === 't') {
      embedUrl.searchParams.append('start', getTimeValueInSeconds(value));
    } else {
      embedUrl.searchParams.append(name, value);
    }
  });

  return embedUrl.toString();
};
const getYouTubeHTML = string => {
  const iframeSrc = getYouTubeIFrameSrc(string);

  return `<iframe width="100%" height="315" src="${iframeSrc}" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>`;
};

module.exports = getYouTubeHTML;
module.exports.shouldTransform = shouldTransform;
module.exports.getYouTubeIFrameSrc = getYouTubeIFrameSrc;
module.exports.getTimeValueInSeconds = getTimeValueInSeconds;

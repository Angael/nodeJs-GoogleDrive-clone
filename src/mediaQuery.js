const smallScreen = "700"; //px
/**
 * Promise that resolves only if screen is smaller than @var smallScreen
 */
export function smallScreenOnly() {
  //   console.log(
  //     "$(window).width() < smallScreen :",
  //     $(window).width() < smallScreen
  //   );
  return new Promise((resolve, reject) => {
    if ($(window).width() < smallScreen) {
      resolve();
    } else {
      //reject();
    }
  });
}
/**
 * Promise that resolves only if screen is bigger than @var smallScreen
 */
export function bigScreenOnly() {
  return new Promise((resolve, reject) => {
    if ($(window).width() < smallScreen) {
      //reject();
    } else {
      resolve();
    }
  });
}

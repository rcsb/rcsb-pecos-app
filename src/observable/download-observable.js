import { BehaviorSubject } from 'rxjs';

const _subject = new BehaviorSubject();

export const DownloadEventObservable = {
  newEvent: (event) => {
    _subject.next(event);
  } ,
  onEvent: () => _subject.asObservable()
}

export default DownloadEventObservable;
import { NativeMapElement } from './component';
import './component';
import Map from 'ol/Map';

describe('NativeMapElement', () => {
  let nativeMapEl: NativeMapElement;

  beforeEach(() => {
    nativeMapEl = document.createElement('native-map') as NativeMapElement;
  });

  describe('when not attached', () => {
    it('has no OL map', () => {
      expect(nativeMapEl['olMap']).toBeFalsy();
    });
  });

  describe('once attached', () => {
    let disposeSpy;
    let addEventListenerSpy;
    let removeEventListenerSpy;
    beforeEach(() => {
      document.body.appendChild(nativeMapEl);
      disposeSpy = jest.spyOn(nativeMapEl['olMap'], 'dispose');
      addEventListenerSpy = jest.spyOn(
        nativeMapEl['olMap'],
        'addEventListener'
      );
      removeEventListenerSpy = jest.spyOn(
        nativeMapEl['olMap'],
        'removeEventListener'
      );
    });
    it('has an OL map', () => {
      expect(nativeMapEl['olMap']).toBeInstanceOf(Map);
    });
    it('does not listen to click events', () => {
      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'featuresClicked',
        expect.any(Function)
      );
    });

    describe('has a listener registered for featuresClicked', () => {
      let listener;
      beforeEach(() => {
        listener = () => console.log('hello');
        nativeMapEl.addEventListener('featuresClicked', listener);
      });
      it('listens to click events', () => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function)
        );
      });
      describe('when another listener is added', () => {
        beforeEach(() => {
          addEventListenerSpy.mockClear();
          nativeMapEl.addEventListener('featuresClicked', listener);
        });
        it('does not listen to click events again', () => {
          expect(addEventListenerSpy).not.toHaveBeenCalledWith(
            'click',
            expect.any(Function)
          );
        });
      });
      describe('when the listener is removed', () => {
        beforeEach(() => {
          nativeMapEl.removeEventListener('featuresClicked', listener);
        });
        it('has stopped listening to click events', () => {
          expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'click',
            expect.any(Function)
          );
        });
      });
    });

    describe('once detached', () => {
      beforeEach(() => {
        document.body.removeChild(nativeMapEl);
      });
      it('has disposed the OL map', () => {
        expect(disposeSpy).toHaveBeenCalled();
      });
      it('has no OL map', () => {
        expect(nativeMapEl['olMap']).toBeFalsy();
      });
    });

    describe('once detached, with a featuresClicked listener', () => {
      beforeEach(() => {
        nativeMapEl.addEventListener('featuresClicked', () => {
          console.log('hello');
        });
        document.body.removeChild(nativeMapEl);
      });
      it('has stopped listening to click events', () => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function)
        );
      });
    });
  });
});

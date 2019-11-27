import { getGeoreferencia } from '../serviciosGeoreferencia';

test('get georeferencia', () => {
    const geoRef = getGeoreferencia('las amapolas 92, neuquen, neuquen');

    geoRef.then(value => {
        expect(value).toBe({ lat: -38.9326874, lng: -68.0716869 });
    });
});

import app from './firebase';
import 'firebase/analytics';
import type firebase from 'firebase';

let ana : firebase.analytics.Analytics | null = null;

if (process.client)
{
    ana = app.analytics();
    console.log("analytics")
}

export default ana;
import Centrifuge from 'centrifuge';

class CentrifugeSingleton {
	/**
	 * @type {Centrifuge}
	 */
	static instance: Centrifuge = null;

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}

		this.instance = new Centrifuge(`https://localhost:${process.env.CENTRIFUGO_PORT}`);

		const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.GXJt-BM9mvzAQfhKNAgAHLu7y6dVFSl6XWqc-ODCgwc';
		this.instance.setToken(token);
		this.instance.connect();

		return this.instance;
	}

	static connect() {
		this.getInstance();
	}

	static disconnect() {
		if (this.instance) {
			this.instance.disconnect();
			this.instance = null;
		}
	}
}

export default CentrifugeSingleton;

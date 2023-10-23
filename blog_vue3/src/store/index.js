import {createStore} from 'vuex'
import identify from "./modules/token";

export default createStore({

    modules: {
        identify,
    }

})


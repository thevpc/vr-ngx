import { VrWpmService } from '../wpm/services/vr.wpm.service';
import { VrEduService } from '../edu/services/vr.edu.service';
import { VrMenu } from './services/vr.menu';
import { VrService } from './services/vr.service';
import { VrSharedState } from './services/vr.shared-state';
import { VrAuthProvider } from './services/vr.auth-provider';
import { VrHttp } from './services/vr.http';

export const VR_CORE_PROVIDERS=[
    VrHttp,
    VrAuthProvider,
    VrSharedState,
    VrService,
    VrMenu,
    VrEduService,
    VrWpmService,
];
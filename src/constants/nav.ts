import IconAccountBox from '~/assets/icons/nav/account_box.svg?component-solid'
import IconAccountBoxAlt from '~/assets/icons/nav/account_box_alt.svg?component-solid'
import IconAllInbox from '~/assets/icons/nav/all_inbox.svg?component-solid'
import IconAllInboxAlt from '~/assets/icons/nav/all_inbox_alt.svg?component-solid'
import IconWavingHand from '~/assets/icons/nav/waving_hand.svg?component-solid'
import IconWavingHandAlt from '~/assets/icons/nav/waving_hand_alt.svg?component-solid'

import type { IconType } from '~/components'

export const Sections = {
    hero: {
        label: 'Welcome',
        icon: IconWavingHand,
        altIcon: IconWavingHandAlt,
    },
    projects: {
        label: 'Projects',
        icon: IconAllInbox,
        altIcon: IconAllInboxAlt,
    },
    contact: {
        label: 'Contact',
        icon: IconAccountBox,
        altIcon: IconAccountBoxAlt,
    },
} as const satisfies Record<string, { label: string; icon: IconType; altIcon: IconType }>

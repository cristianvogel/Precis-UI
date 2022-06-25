export {}

interface PrController {
    getMappedValue(): number
}

class Dial implements PrController {
    getMappedValue(): number { return 0
    }
}

class Fader implements PrController {
    getMappedValue(): number {return 0
    }
}

class NullCont implements PrController {
    getMappedValue(): number {
        return -1
    }
}

const widgetMap = {
    dial: Dial,
    fader: Fader
}

type Keys = keyof typeof widgetMap

type WidgetTypes = typeof widgetMap[Keys]

type ExtractInstanceType<T> = T extends new () => infer R ? R : never

class WidgetFactory {
    static getWidget(k: Keys): ExtractInstanceType<WidgetTypes> {
        return new widgetMap[k]()
    }
}

class WidgetService {
    getMappedValueFrom(widget: Keys) {
        return WidgetFactory.getWidget(widget).getMappedValue()
    }
}

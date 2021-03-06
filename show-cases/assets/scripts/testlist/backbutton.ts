import { _decorator, ButtonComponent, Component, director, game, Node, ScrollViewComponent, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { sceneArray } from './scenelist';

@ccclass('BackButton')
export class BackButton extends Component {

    public static get offset () {
        return BackButton._offset;
    }

    public static set offset ( value ) {
        BackButton._offset = value;
    }
    public static _scrollNode: Node | null  = null;

    public static saveOffset () {
        if ( BackButton._scrollNode ) {
            BackButton._offset = new Vec3(0, BackButton._scrollCom.getScrollOffset().y, 0);
        }
    }

    public static saveIndex ( index: number) {
        BackButton._sceneIndex = index;
        BackButton.refreshButton();
    }

    public static refreshButton () {
        if (BackButton._sceneIndex === -1) {
            BackButton._prevNode.active = false;
            BackButton._nextNode.active = false;
        } else {
            BackButton._prevNode.active = true;
            BackButton._nextNode.active = true;
        }
    }
    private static _offset = new Vec3();
    private static _scrollCom: ScrollViewComponent | null = null;

    private static _sceneIndex: number = -1;
    private static _prevNode: Node;
    private static _nextNode: Node;
    private static _prevButton: ButtonComponent;
    private static _nextButton: ButtonComponent;

    public __preload () {
        const sceneInfo = game._sceneInfos;
        let firstIndex = 0;
        let lastIndex = 0;
        let sceneString: string = '';
        for (let i = 0; i < sceneInfo.length; i++){
            sceneString = sceneInfo[i].url;
            firstIndex = sceneString.lastIndexOf('/') + 1;
            lastIndex = sceneString.lastIndexOf('.scene');
            sceneString = sceneString.substring(firstIndex, lastIndex);
            if (sceneString === 'testlist') {
                continue;
            }
            sceneArray.push(sceneString);
        }
    }

    public start () {
        game.addPersistRootNode(this.node);
        BackButton._scrollNode = this.node.getParent().getChildByPath('Canvas/ScrollView') as Node;
        if (BackButton._scrollNode) {
            BackButton._scrollCom = BackButton._scrollNode.getComponent(ScrollViewComponent);
        }
        BackButton._prevNode = this.node.getChildByName('PrevButton') as Node;
        BackButton._nextNode = this.node.getChildByName('NextButton') as Node;
        if (BackButton._prevNode && BackButton._nextNode) {
            BackButton._prevButton = BackButton._prevNode.getComponent(ButtonComponent);
            BackButton._nextButton = BackButton._nextNode.getComponent(ButtonComponent);
            BackButton.refreshButton();
        }
    }

    public backToList () {
        director.loadScene('testlist');
        BackButton._sceneIndex = -1;
        BackButton.refreshButton();
        const self = this;
        setTimeout(() => {
            BackButton._scrollNode = self.node.getParent().getChildByPath('Canvas/ScrollView') as Node;
            if (BackButton._scrollNode) {
                BackButton._scrollCom = BackButton._scrollNode.getComponent(ScrollViewComponent);
                BackButton._scrollCom.scrollToOffset(BackButton.offset, 0.1, true);
            }
        }, 100);
    }

    public nextscene () {
        BackButton._nextButton.interactable = false;
        this.updateSceneIndex(true);
        director.loadScene(this.getSceneName(), () => {
            BackButton._nextButton.interactable = true;
        });
    }

    public prescene () {
        BackButton._prevButton.interactable = false;
        this.updateSceneIndex(false);
        director.loadScene(this.getSceneName(), () => {
            BackButton._prevButton.interactable = true;
        });
    }

    public updateSceneIndex (next: Boolean) {
        if (next) {
            (BackButton._sceneIndex + 1) >= sceneArray.length ? BackButton._sceneIndex = 0 : BackButton._sceneIndex += 1;
        }else {
            (BackButton._sceneIndex - 1) < 0 ? BackButton._sceneIndex = sceneArray.length - 1 : BackButton._sceneIndex -= 1;
        }
    }

    public getSceneName () {
        return sceneArray[BackButton._sceneIndex];
    }
}

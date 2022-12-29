import os
import sys
from PyQt5.QtWidgets import QApplication, QVBoxLayout, QWidget, QSizeGrip
from PyQt5.QtCore import QUrl, QEventLoop, pyqtSlot, Qt, QRect
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWebChannel import QWebChannel

class App(QWebEngineView):

    def __init__(self):
        super().__init__()
        self.title = 'Mars'
        self.resize(750, 500);

        self.setWindowFlags(Qt.FramelessWindowHint)

        self.setStyleSheet("QMainWindow{background-color: transparent;border: 1px solid black}")
        #self.setGeometry(QRect(300, 300, 750, 500))
        #self.setAttribute(QtCore.Qt.WA_TranslucentBackground, True)
        #self.setStyleSheet("background:rgba(0,0,0,1);")

        # setup a page with my html
        self.load(QUrl().fromLocalFile(os.path.split(os.path.abspath(__file__))[0]+r'\index.html'))

        # setup channel
        self.channel = QWebChannel()
        self.channel.registerObject('backend', self)
        self.page().setWebChannel(self.channel)
        self.show()

    @pyqtSlot()
    def foo(self):
        print('bar')

    @pyqtSlot()
    def close(self):
        self.exit()


if __name__ == "__main__":
    app = QApplication.instance() or QApplication(sys.argv)
    app.setStyleSheet("QMainWindow{background-color: transparent;border: 1px solid black}")
    view = App()
    view.show()
    app.exec_()